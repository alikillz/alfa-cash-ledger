import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://aqfuqgvrdgqlxczmeket.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZnVxZ3ZyZGdxbHhjem1la2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njg3NjcsImV4cCI6MjA3MjI0NDc2N30.Bgw8EaSwgUvv9wJ8auMt9A4lEl3i8xu4ng8anTqbfaw'
    );
  }

  get client() {
    return this.supabase;
  }
}
