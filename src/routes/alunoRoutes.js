const express = require("express");
const alunoController = require("../controllers/AlunoController");
const validarAluno = require("../middlewares/validarAluno");

const router = express.Router();

router.get("/",(request, response, next)=>{
    console.log("Executando antes do findMany");
    next();
}, alunoController.findMany);
router.post("/", validarAluno, alunoController.create);
router.get("/:id", alunoController.findOne);
//No PUT a validação de negócio fica no Service (usando o schema zod em modo parcial),
//porque o enunciado permite atualizar apenas nome ou apenas email — diferente do POST,
//em que validarAluno exige os dois campos.
router.put("/:id", alunoController.update);
router.delete("/:id", alunoController.remove);

module.exports = router;