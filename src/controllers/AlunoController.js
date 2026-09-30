const alunoService = require("../services/AlunoService");

class AlunoController{

    async findMany(request, response){
        let {page, pageSize, orderBy, order} = request.query;
        page = Number(page) || 1;
        pageSize = Number(pageSize) || 10;
        orderBy ||= "id";
        order ||= "asc";

        try{
            const {alunos, total} = await alunoService.findMany(page, pageSize, orderBy, order);
            return response.status(200).json({alunos, total});
        }catch(e){
            return response.status(e.statusCode || 500).json({error: e.message});
        }
    }

    async findOne(request, response){
        try{
            const {id} = request.params;
            const aluno = await alunoService.findById(id);
            return response.status(200).json({aluno});
        }catch(e){
            return response.status(e.statusCode || 500).json({error: e.message});
        }
    }

    async update(request, response){
        try{
            const {id} = request.params;
            const aluno = await alunoService.update(id, request.body);
            return response.status(200).json({aluno});
        }catch(e){
            return response.status(e.statusCode || 500).json({error: e.message});
        }
    }

    async create(request, response){
        try{
            const aluno = await alunoService.create(request.body);
            return response.status(201).json({aluno});
        }catch(e){
            return response.status(e.statusCode).json({error: e.message});
        }
    }
}

module.exports = new AlunoController();