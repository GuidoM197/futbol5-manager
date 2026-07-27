package ar.uba.fi.ingsoft1.todo_template.user.pictureSaver;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface PictureSaver<T> {
    String savePicture(MultipartFile file) throws IOException;
    byte[] getPicture(T path);
}
