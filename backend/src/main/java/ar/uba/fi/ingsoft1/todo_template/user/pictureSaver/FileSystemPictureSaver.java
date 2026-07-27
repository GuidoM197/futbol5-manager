package ar.uba.fi.ingsoft1.todo_template.user.pictureSaver;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileSystemPictureSaver implements PictureSaver<String> {
    @Override
    public String savePicture(MultipartFile photo) throws IOException {
        String projectRoot = System.getProperty("user.dir");

        if (projectRoot.endsWith("/backend")) {
            projectRoot = projectRoot.substring(0, projectRoot.length() - "/backend".length());
        }

        String uploadDir = projectRoot + "/uploads/";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String uuid = java.util.UUID.randomUUID().toString();
        String fileName = "user_picture_" + uuid + ".jpg";
        Path filePath = uploadPath.resolve(fileName);
        photo.transferTo(filePath.toFile());
        System.out.println("Saving at: " + filePath.toAbsolutePath());

        return fileName;
    }

    @Override
    public byte[] getPicture(String fileName) {
        String projectRoot = System.getProperty("user.dir");

        if (projectRoot.endsWith("/backend")) {
            projectRoot = projectRoot.substring(0, projectRoot.length() - "/backend".length());
        }

        String uploadDir = projectRoot + "/uploads/";
        Path filePath = Paths.get(uploadDir, fileName);

        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Cannot read file: " + fileName, e);
        }
    }
}
