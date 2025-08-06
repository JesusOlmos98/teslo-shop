import { v4 as uuid } from 'uuid';

export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if (!file) return callback(new Error('File is empty.'), false); //* Al devolver esa callback con false decimos "No aceptes ese archivo"

    const fileName = file.originalname.split('.')[0];
    console.log(file.originalname);
    console.log(fileName)
    const fileExtension = file.mimetype.split('/')[1];
    const finalFileName = fileName+"_" + uuid() + "." + fileExtension;

    callback(null, finalFileName);

    // callback(null, false);
}