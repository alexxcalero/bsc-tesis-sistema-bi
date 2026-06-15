package pe.com.banco.bi.module2.common.storage;

import java.io.InputStream;
import java.nio.file.Path;

public interface StorageService {

    String store(String filename, InputStream inputStream);

    Path load(String filename);

    InputStream loadAsInputStream(String filename);

    void delete(String filename);

    String getStoragePath();
}
