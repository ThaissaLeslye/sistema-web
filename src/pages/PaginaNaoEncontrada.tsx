import { Link } from "react-router-dom";

export function PaginaNaoEncontrada() {
    return (
        <section
            className="bg-white border rounded-3 p-4 text-center"
            aria-labelledby="titulo-pagina-nao-encontrada"
        >
            <p
                className="fw-bold text-uppercase small mb-1"
                style={{ color: "var(--cor-primaria)" }}
            >
                Erro 404
            </p>
            <h1
                id="titulo-pagina-nao-encontrada"
                className="h4 fw-bold mb-2"
                style={{ color: "var(--cor-primaria)" }}
            >
                Página não encontrada
            </h1>
            <p
                className="mb-3"
                style={{ color: "var(--cor-texto-secundario)" }}
            >
                O endereço acessado não existe ou foi movido.
            </p>
            <Link to="/" className="btn btn-primary btn-sm fw-semibold">
                Voltar para a listagem de clientes
            </Link>
        </section>
    );
}
