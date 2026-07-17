package pe.com.banco.bi.module2.common.event;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import pe.com.banco.bi.module2.common.processor.AsyncCargaProcessor;
import pe.com.banco.bi.module2.common.processor.PublicacionAsyncProcessor;

@Component
@RequiredArgsConstructor
public class CargaEventListener {

    private final AsyncCargaProcessor asyncCargaProcessor;
    private final PublicacionAsyncProcessor publicacionAsyncProcessor;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handle(CargaRegistradaEvent event) {
        asyncCargaProcessor.procesarCarga(event.procesoCargaId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handlePublicacion(CargaPublicadaEvent event) {
        publicacionAsyncProcessor.procesarPublicacion(event.procesoCargaId());
    }
}
