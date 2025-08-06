
export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    console.log({ file });
    if (!file) return callback(new Error('File is empty.'), false); //* Al devolver esa callback con false decimos "No aceptes ese archivo"

    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    //* Si la extensión es una de las válidas, aceptamos el archivo
    if (validExtensions.includes(fileExtension)) return callback(null, true);

    callback(null, false);
}