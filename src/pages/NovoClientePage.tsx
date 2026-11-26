import { Link } from "react-router-dom";

export function NovoClientePage() {
    return (
        <section
            className="bg-white border rounded-3 p-3 p-md-4"
            aria-labelledby="titulo-novo-cliente"
        >
            <div className="mb-3">
                <Link to="/" className="text-decoration-none small fw-semibold">
                    ← Voltar para clientes
                </Link>
            </div>

            <h1
                id="titulo-novo-cliente"
                className="h4 text-uppercase fw-bold mb-2"
                style={{ color: "var(--cor-primaria-escura)" }}
            >
                Novo Cliente
            </h1>

            <p
                className="mb-0"
                style={{ color: "var(--cor-texto-secundario)" }}
            >
                O formulário de cadastro em memória será integrado nesta rota na
                próxima etapa.
            </p>
        </section>
    );
}
