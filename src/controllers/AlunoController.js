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

    async remove(request, response){
        try{
            const {id} = request.params;
            const aluno = await alunoService.remove(id);
            /*Status da remoção bem-sucedida: escolhi 200 com uma mensagem de confirmação
              (e os dados removidos) para o cliente saber o que aconteceu. Alternativa
              válida seria 204 No Content, com corpo vazio — aqui decidi informar o
              resultado, pois a operação tem efeito visível para quem chamou a API. */
            return response.status(200).json({message: "Aluno removido com sucesso", aluno});
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