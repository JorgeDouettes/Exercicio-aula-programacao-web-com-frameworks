const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");

class AlunoService{

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