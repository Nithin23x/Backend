import { v2 as cloudinary } from "cloudinary";
import fs from 'fs' // file system module 

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_USERNAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

//cloudinary takes the file from user and uplaods into their server.this is  "basic approcah "

//multer is used to access the disk storage.With the help of multer,file uploaded by user and it will be saved to local server 
//then cloudinary takes the files from  local-server and stores it 


const fileUpload = async(filepath) =>{
    //filepath is from the local-server 
    try {
        if(!filepath) return 'Cannot find path '

        const uploadResponse = await cloudinary.uploader.upload("https://files.porsche.com/filestore/image/multimedia/none/992-gt3-rs-modelexplorer/normal/c310eed8-1a15-11ed-80f5-005056bbdc38;sS;twebp/porsche-normal.webp",
            {
                resource_type:'auto',
            }
            //file has been uploaded 
        )
        console.log("file uploaded",uploadResponse)
        return uploadResponse
    } catch (error) {
        // the local filepath we get is from local-server if there is an error we delete the file in local-server for 
        //security purposes 
        fs.unlinkSync(filepath) //removes the locally saved temp files as the upload operation failed

        return null 
    }
}

export {fileUpload}