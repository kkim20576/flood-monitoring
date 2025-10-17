// api/data.js
import { createClient } from '@supabase/supabase-js';

// Use your Supabase credentials
const supabase = createClient(
  'https://jusgcbcxjmpajtzjbixd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1c2djYmN4am1wYWp0empiaXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTc1MjIsImV4cCI6MjA3NjI5MzUyMn0.07MSyuY841UeANU5U23nK9jatLkBdBX8DyF2eBSL4YM'
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // Handle data from Arduino
      const { device_id, water_level, latitude, longitude, satellites } = req.body;
      
      console.log('📨 Received data from Arduino:', {
        device_id, water_level, latitude, longitude, satellites
      });

      // Validate required fields
      if (!device_id || water_level === undefined || !latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const { data, error } = await supabase
        .from('flood_data')
        .insert([
          {
            device_id: device_id,
            water_level: parseFloat(water_level),
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            satellites: parseInt(satellites) || 0
          }
        ])
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        return res.status(400).json({ 
          success: false, 
          error: error.message 
        });
      }

      console.log('✅ Data saved to Supabase:', data);
      return res.status(200).json({ 
        success: true, 
        message: 'Data saved successfully',
        data: data 
      });

    } else if (req.method === 'GET') {
      // Handle data request from website
      const { data, error } = await supabase
        .from('flood_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Supabase error:', error);
        return res.status(400).json({ 
          success: false, 
          error: error.message 
        });
      }

      return res.status(200).json({ 
        success: true, 
        data: data 
      });

    } else {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }
  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}