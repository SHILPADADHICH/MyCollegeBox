import { supabase } from "./supabase";
import { Profile, ProfileUpdate } from "../types/profile";

export const profileService = {
  // Get current user's profile
  async getProfile(): Promise<Profile | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  },

  // Update current user's profile
  async updateProfile(updates: ProfileUpdate): Promise<Profile | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return null;
    }

    return data;
  },

  // Get profile by user ID (for viewing other profiles)
  async getProfileById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile by ID:", error);
      return null;
    }

    return data;
  },
  
  // Create a default profile for a user if it doesn't exist already
  async ensureProfileExists(userId: string | undefined = undefined): Promise<Profile | null> {
    try {
      // Get current user if userId not provided
      let userToUse: string;
      
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("No authenticated user found");
        }
        userToUse = user.id;
      } else {
        userToUse = userId;
      }
      
      console.log("Ensuring profile exists for user:", userToUse);
      
      // Try multiple approaches to ensure the profile exists
      
      // 1. First, check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id') // Only select ID to minimize data transfer
        .eq('id', userToUse)
        .maybeSingle();
        
      // Profile exists, we're done
      if (existingProfile) {
        console.log("Profile already exists for user");
        return existingProfile as Profile;
      }
      
      console.log("Profile not found, attempting to create");
      
      // 2. Profile doesn't exist, try to create with minimal fields
      try {
        // Just insert the ID (primary key) - this should work even with
        // strict schema requirements as ID is always required
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userToUse })
          .select()
          .single();
          
        if (insertError) {
          console.error("Failed to insert profile:", insertError);
          throw insertError;
        }
        
        console.log("Profile created successfully");
        return newProfile;
      } 
      catch (insertError) {
        console.error("Error creating profile:", insertError);
        
        // 3. If first attempt failed, try a workaround for older PostgreSQL versions
        try {
          // Some PostgreSQL versions require all non-nullable fields
          // Try to get the table structure first
          const { error: structError } = await supabase
            .from('profiles')
            .select('id');
            
          if (structError) {
            console.error("Error checking profiles table:", structError);
            throw new Error(`Cannot access profiles table: ${structError.message}`);
          }
          
          // Simplest approach - just update the user ID which will upsert the record
          const { data: upsertResult, error: upsertError } = await supabase
            .from('profiles')
            .upsert({ id: userToUse })
            .select()
            .single();
            
          if (upsertError) {
            console.error("Upsert approach failed:", upsertError);
            throw upsertError;
          }
          
          console.log("Profile created using upsert");
          return upsertResult;
        }
        catch (finalError) {
          console.error("All profile creation attempts failed");
          throw new Error("Could not create user profile after multiple attempts");
        }
      }
    } 
    catch (error) {
      console.error("Error in ensureProfileExists:", error);
      return null;
    }
  }
};
