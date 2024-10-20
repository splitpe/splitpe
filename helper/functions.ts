import { supabase } from "~/utils/supabase";

export async function generateSignedUrl(bucketName, fileName, expiresIn) {
    const { data, error } = await supabase
        .storage
        .from(bucketName)
        .createSignedUrl(fileName, expiresIn); // expiresIn is in seconds

    if (error) {
        console.error('Error creating signed URL:', error);
        return null;
    }
    //console.log(data.signedUrl);
    return data.signedUrl;
}