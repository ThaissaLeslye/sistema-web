import { Link, useParams } from "react-router-dom";

export function ClienteDetalhePage() {
    const { id } = useParams();

    return (
        <section
            className="bg-white border rounded-3 p-3 p-md-4"
            aria-labelledby="titulo-detalhe-cliente"
        >
            <div className="mb-3">
                <Link to="/" className="text-decoration-none small fw-semibold">
                    ← Voltar para clientes
                </Link>
            </div>

            <h1
                id="titulo-detalhe-cliente"
                className="h4 text-uppercase fw-bold mb-2"
                style={{ color: "var(--cor-primaria)" }}
            >
                Detalhes do Cliente
            </h1>

            <p
                className="mb-0"
                style={{ color: "var(--cor-texto-secundario)" }}
            >
                Identificador selecionado:{" "}
                <strong>{id ?? "não informado"}</strong>. A exibição completa de
                dados cadastrais, contas e agência será integrada na próxima
                etapa.
            </p>
        </section>
    );
}
