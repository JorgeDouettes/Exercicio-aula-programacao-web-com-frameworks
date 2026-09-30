const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");
const AlunoNaoEncontradoError = require("../errors/AlunoNaoEncontradoError");

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