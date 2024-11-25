import { supabase } from './supabaseClient';

const uploadToSupabase = async (blob, fileName) => {
  try {
    // Convert Blob to Uint8Array (Supabase accepts this format)
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('avatars') // Replace with your Supabase bucket
      .upload(fileName, uint8Array, {
        contentType: 'image/png', // Pass the MIME type of the file
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    console.log('File uploaded successfully:', data);
    return data; // Contains file metadata and key
  } catch (err) {
    console.error('Blob upload error:', err);
    return null;
  }
};

export default uploadToSupabase;
