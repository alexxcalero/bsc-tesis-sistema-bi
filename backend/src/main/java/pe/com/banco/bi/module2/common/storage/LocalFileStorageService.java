package pe.com.banco.bi.module2.common.storage;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class LocalFileStorageService implements StorageService {

    private final Path storagePath;

    public LocalFileStorageService(@Value("${app.storage.local.path}") String storagePath) {
        this.storagePath = Paths.get(storagePath).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(storagePath);
        } catch (IOException e) {
            throw new StorageException("No se pudo crear el directorio de almacenamiento: " + storagePath, e);
        }
    }

    @Override
    public String store(String filename, InputStream inputStream) {
        String uniqueFilename = UUID.randomUUID() + "_" + filename;
        Path destination = storagePath.resolve(uniqueFilename);
        try {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
            return uniqueFilename;
        } catch (IOException e) {
            throw new StorageException("Error al guardar archivo: " + filename, e);
        }
    }

    @Override
    public Path load(String filename) {
        return storagePath.resolve(filename).normalize();
    }

    @Override
    public InputStream loadAsInputStream(String filename) {
        try {
            return Files.newInputStream(load(filename));
        } catch (IOException e) {
            throw new StorageException("Error al leer archivo: " + filename, e);
        }
    }

    @Override
    public void delete(String filename) {
        try {
            Files.deleteIfExists(load(filename));
        } catch (IOException e) {
            throw new StorageException("Error al eliminar archivo: " + filename, e);
        }
    }

    @Override
    public String getStoragePath() {
        return storagePath.toString();
    }
}
