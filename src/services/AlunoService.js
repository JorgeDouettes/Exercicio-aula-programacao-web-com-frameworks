const prisma = require("../databases/prisma");
const alunoSchema = require("../schemas/alunoSchema");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");
const AlunoNaoEncontradoError = require("../errors/AlunoNaoEncontradoError");
const EmailDuplicadoError = require("../errors/EmailDuplicadoError");

class AlunoService{

    //Valida o id recebido pela rota (params chegam como string)
    validarId(id){
        const idAluno = Number(id);
        if(!Number.isInteger(idAluno) || idAluno <= 0){
            throw new AlunoInvalidoError("Id inválido", 400);
        }
        return idAluno;
    }

    async findMany(page, pageSize, orderBy, order){
        //Campos que podem ser usados na ordenação (evita erro de campo inexistente no Prisma)
        const camposPermitidos = ["id", "nome", "email", "createdAt", "updatedAt"];
        const campo = camposPermitidos.includes(orderBy) ? orderBy : "id";

        //Direção válida apenas "asc" ou "desc"; qualquer outro valor vira "asc"
        const direcao = ["asc", "desc"].includes(String(order).toLowerCase())
            ? String(order).toLowerCase()
            : "asc";

        //SELECT * FROM alunos ORDER BY campo direcao
        const [alunos, total] = await Promise.all([
            prisma.aluno.findMany({
                skip: (page-1)*pageSize,
                take: Number(pageSize),
                orderBy: {[campo]: direcao}
            }),
            //SELECT COUNT(*) FROM alunos
            prisma.aluno.count()
        ]);

        return {alunos, total};
    }

    async findById(id){
        const idAluno = this.validarId(id);
        //SELECT * FROM alunos WHERE id = ?
        const aluno = await prisma.aluno.findUnique({
            where: {id: idAluno}
        });

        if(!aluno){
            throw new AlunoNaoEncontradoError();
        }

        return aluno;
    }

    async update(id, aluno){
        const idAluno = this.validarId(id);

        /*Justificativa das exceções do Requisito 3 (cada caso merece o quê?):
          1) Dados inválidos / corpo vazio / sem nenhum campo válido -> REAPROVEITO a
             AlunoInvalidoError (400), a mesma do create: em ambos o problema é o
             conteúdo enviado pelo cliente, não o estado do banco.
             Detalhe: o enunciado permite atualizar "nome e/ou email", então valido com o
             schema zod do projeto em modo PARCIAL (.partial()) — o middleware validarAluno
             exige os dois campos e por isso não é usado no PUT.
          2) Aluno não encontrado -> REAPROVEITO a AlunoNaoEncontradoError (404) criada
             no Requisito 2: é exatamente o mesmo erro (id que não corresponde a aluno),
             não faria sentido criar uma segunda classe para a mesma situação.
          3) Email duplicado -> CRIEI a EmailDuplicadoError (409): não é um dado mal
             formatado (400) nem um aluno inexistente (404), e sim um CONFLITO com um
             registro já existente. Como email é @unique no schema, o Prisma lança o erro
             P2002 (violação de constraint única) e eu converto isso em 409. */
        const parse = alunoSchema.partial().safeParse(aluno);
        if(!parse.success){
            throw new AlunoInvalidoError("Dados inválidos: informe um nome válido (mín. 3 caracteres) e/ou um e-mail válido", 400);
        }
        const dados = parse.data;
        if(Object.keys(dados).length === 0){
            throw new AlunoInvalidoError("Corpo vazio: informe ao menos um campo (nome e/ou email) para atualizar", 400);
        }

        //Verifica se o aluno existe antes de atualizar
        const alunoExistente = await prisma.aluno.findUnique({
            where: {id: idAluno}
        });
        if(!alunoExistente){
            throw new AlunoNaoEncontradoError();
        }

        try{
            //UPDATE alunos SET nome = ?, email = ? WHERE id = ?
            const alunoAtualizado = await prisma.aluno.update({
                where: {id: idAluno},
                data: dados
            });
            return alunoAtualizado;
        }catch(e){
            //P2002 = violação de constraint única do Prisma (email já cadastrado)
            if(e.code === "P2002"){
                throw new EmailDuplicadoError();
            }
            throw e;
        }
    }

    async remove(id){
        const idAluno = this.validarId(id);

        /*Justificativa (Requisito 4): reaproveito a AlunoNaoEncontradoError (404) criada
          no Requisito 2 — é o mesmo erro (id sem aluno correspondente), então não crio
          uma nova classe. Antes de deletar, verifico a existência com findUnique; além
          disso trato o erro P2025 do Prisma (\"Record to delete does not exist.\"),
          caso o aluno seja removido entre a consulta e o delete. */

        //Verifica se o aluno existe antes de remover
        const alunoExistente = await prisma.aluno.findUnique({
            where: {id: idAluno}
        });
        if(!alunoExistente){
            throw new AlunoNaoEncontradoError();
        }

        try{
            //DELETE FROM alunos WHERE id = ?
            const alunoRemovido = await prisma.aluno.delete({
                where: {id: idAluno}
            });
            return alunoRemovido;
        }catch(e){
            //P2025 = registro não encontrado (aluno removido por outra requisição)
            if(e.code === "P2025"){
                throw new AlunoNaoEncontradoError();
            }
            throw e;
        }
    }

    async create(aluno){
        const {nome, email} = aluno;
        if(!nome || !email){
            throw new AlunoInvalidoError();
        }
        //create = insert
        //update = update
        //delete = delete
        //findMany = select * from
        const novoAluno = await prisma.aluno.create({data:aluno});

        return novoAluno;
    }
}

module.exports = new AlunoService();