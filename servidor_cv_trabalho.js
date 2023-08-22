var express = require('express'); // requisita a biblioteca para a criacao dos serviços web. - ela carrega a biblioteca express
var pg = require("pg"); // requisita a biblioteca pg para a comunicacao com o banco de dados. - ela carrega a biblioteca pg

var sw = express(); // iniciliaza uma variavel chamada app que possitilitará a criação dos serviços e rotas.  - 

sw.use(express.json());//padrao de mensagens em json.

//permite o reconhecimento de qualquer origem, aceita as informações no cabeçalho e permite a criação dos servidores.
//permite os metodos get e post
sw.use(function(req, res, next) { 
    res.header('Access-Control-Allow-Origin', '*'); //
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET,POST'); 
    next();
});

const config = {
    host: 'localhost',
    user: 'postgres',
    database: 'db_cv_prog3_2023',
    password: 'postgres',
    port: 5432
};

//definia conexao com o banco de dados.
const postgres = new pg.Pool(config);

//definicao do primeiro serviço web.
sw.get('/', (req, res) => {
    res.send('Hello, world! meu primeiro teste.  #####');
});

//iniciar o processo de escuta na porta 4000
sw.listen(4000, function () {
    console.log('Server is running.. on Port 4000');
});


//list fornecedor
sw.get('/listfornecedor', function (req, res) {

    //estabelece uma conexao com o bd.
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Não conseguiu acessar o BD :"+ err);
           res.status(400).send('{'+err+'}');
       }else{
        client.query("select tb_pessoa.cpf, tb_pessoa.tipo, tb_pessoa.rg, tb_pessoa.nome, tb_pessoa.numero_celular, tb_pessoa.email,  to_char(tb_pessoa.data_nascimento, \'yyyy-mm-dd\') as data_nascimento , tb_pessoa.data_cadastro, tb_pessoa.cep, tb_pessoa.endereco, tb_pessoa.complemento, tb_fornecedor.cnpj, tb_fornecedor.ie, tb_pessoa.senha  from tb_fornecedor, tb_pessoa where tb_pessoa.cpf = tb_fornecedor.cpf order by cpf asc;", function(err,result) {        
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send(result.rows);
                }
                
            });
       } 
    });
});

//insert fornecedor
sw.post('/insertfornecedor', function (req, res, next) {
    
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Nao conseguiu acessar o  BD "+ err);
           res.status(400).send('{'+err+'}');
       }else{            

            var q ={
                text: 'insert into tb_pessoa (tipo, cpf, cep, complemento, data_cadastro, data_nascimento, email, endereco, nome, numero_celular, rg, senha) values ($1, $2, $3, $4, \'now()\', $5, $6, $7, $8, $9, $10, $11) returning cpf, nome, tipo;',
                values: [req.body.tipo, req.body.cpf, req.body.cep, req.body.complemento, req.body.data_nascimento, req.body.email, req.body.endereco, req.body.nome, req.body.numero_celular, req.body.rg, req.body.senha]
            }
            console.log(q);

            var q2 ={
                text: 'insert into tb_fornecedor (cnpj, ie, cpf ) values ( $1, $2, $3) returning cnpj, ie;',
                values: [req.body.cnpj, req.body.ie, req.body.cpf]
            }
            console.log(q2);
    
            client.query(q,function(err,result) {
                //done(); // closing the connection;
                if(err){
                    console.log('retornou 400 pelo insertpessoa');
                    console.log(err);
                    //console.log(err.data);
                    res.status(400).send('{'+err+'}');
                }else{
                    client.query(q2,function(err2,result2) {
                        done(); // closing the connection;
                        if(err2){
                            console.log('retornou 400 pelo insertfornecedor');
                            console.log(err2);
                            //console.log(err.data);
                            res.status(400).send('{'+err2+'}');
                        }else{
                            
                            console.log('retornou 201 no insertfornecedor');
                            //res.status(201).send(result.rows[0]);//se não realizar o send nao finaliza o client

                            res.status(201).send({
                                "tipo":  req.body.tipo,
                                "cpf": req.body.cpf,
                                "cep": req.body.cep,
                                "complemento": req.body.complemento,
                                //"data_cadastro": req.body.data_cadastro,
                                "data_nascimento": req.body.data_nascimento,
                                "email": req.body.email,
                                "endereco": req.body.endereco,
                                "nome": req.body.nome,
                                "numero_celular": req.body.numero_celular,
                                "rg": req.body.rg,
                                "senha": req.body.senha,
                                "cnpj": req.body.cnpj,
                                "ie": req.body.ie,

                                                
                            });

                        }
                    });
                }           
            });
       }
    });
});


//update fornecedor
sw.post('/updatefornecedor', function (req, res, next) {
    
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Nao conseguiu acessar o  BD "+ err);
           res.status(400).send('{'+err+'}');
       }else{            

            var q1 ={
                text: 'update tb_pessoa set cpf = $1, cep = $2, complemento = $3, data_nascimento = $4, email = $5, endereco = $6, nome = $7, numero_celular = $8, rg = $9, senha = $10 where cpf = $1 ' + 'returning  cpf, cep, complemento, to_char(data_nascimento, \'yyyy-mm-dd\') as data_nascimento, email, endereco, nome, numero_celular, rg, senha ;',
                values: [ 
                         //req.body.pessoa.tipo,
                         req.body.cpf, 
                         req.body.cep, 
                         req.body.complemento,
                         req.body.data_nascimento,
                         req.body.email, 
                         req.body.endereco,  
                         req.body.nome,  
                         req.body.numero_celular, 
                         req.body.rg,
                         req.body.senha,  
                        ]
            }
            var q2 = {
                text : 'update tb_fornecedor set cnpj = $1, ie = $2, cpf = $3 where cpf = $3 returning cnpj, ie, cpf;',
                values: [req.body.cnpj, 
                         req.body.ie,
                         req.body.cpf 
                        ]
            }
            console.log(q1);
            console.log(q2);

            client.query(q1, function(err1,result1) {
                if(err1){
                    console.log('retornou 400 no update pessoa');
                    console.log(err1)
                    res.status(400).send('{'+err1+'}');
                }else{
                    client.query(q2, function(err2,result2) {
                        if(err2){
                            console.log(err2);
                            console.log('retornou 400 no update fornecedor');
                            res.status(400).send('{'+err2+'}');
                        }else{
                            
                            done(); // closing the connection;

                            console.log('retornou 201 no update fornecedor ');
                            res.status(201).send({

                                
                                //"tipo": req.body.tipo, 
                                "cpf" : req.body.cpf, 
                                "cnpj": req.body.cnpj,
                                "ie": req.body.ie,

                                "cep": req.body.cep, 
                                "complemento": req.body.complemento, 
                                "data_nascimento": req.body.data_nascimento,
                                //result1.rows[0].data_nascimento,
                                "email": req.body.email,
                                "endereco" : req.body.endereco,
                                "nome" : req.body.nome,
                                "numero_celular" : req.body.numero_celular,
                                "rg" : req.body.rg,
                                "senha" : req.body.senha,
                                
                                
                                                
                            });

                                                  

                                                  
                        }
                    });
                }           
            });
       }       
    });
});


//delete fornecedor
sw.get('/deletefornecedor/:cpf', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){
            console.log("Não conseguiu acessar o banco de dados"+ err);
            res.status(400).send('{'+err+'}');
        }else{
            
            var q2 ={
                text: 'delete from tb_pessoa where cpf = $1',
                values: [req.params.cpf]
            }

            var q1 ={
                text: 'delete from tb_fornecedor where cpf = $1',
                values: [req.params.cpf]
            }
    
                client.query(q1 , function(err1,result1) {
                    //done(); // closing the connection;
                    if(err1){
                        console.log("pessoa" + err1);
                        res.status(400).send('{'+err1+'}');
                    }else{
                        client.query(q2 , function(err2,result2) {
                            done(); // closing the connection;
                            if(err2){
                                console.log(err2);
                                res.status(400).send('{'+err2+'}');
                            }else{
                                res.status(200).send({'cpf': req.params.cpf});//retorna o nome deletado.

                            }
                });
                    //res.status(200).send({'cpf': req.params.tipo});//retorna o nome deletado.
                } 
            });
        }
    }); 
});
    
    
    
    
    




// PRODUTOS //



//list Produto
sw.get('/listproduto', function (req, res) {

    //estabelece uma conexao com o bd.
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Não conseguiu acessar o BD :"+ err);
           res.status(400).send('{'+err+'}');
       }else{
        client.query('select id, nome, quantidade, tipo, valor, fornecedor_cpf from tb_produto order by id asc;',function(err,result) {        
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send(result.rows);
                }
                
            });
       } 
    });
});


//insert produto
sw.post('/insertproduto', function (req, res, next) {
    
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Nao conseguiu acessar o  BD "+ err);
           res.status(400).send('{'+err+'}');
       }else{            
            var q ={
                text: 'insert into tb_produto (id, nome, quantidade, tipo, valor, fornecedor_cpf) values (nextval(\'seq_produto_id\'), $1, $2, $3, $4, $5) returning id, nome, quantidade, tipo, valor, fornecedor_cpf;',
                values: [req.body.nome, req.body.quantidade, req.body.tipo, req.body.valor, req.body.fornecedor.cpf]
            }
            console.log(q);
    
            client.query(q,function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log('retornou 400 pelo insertproduto');
                    //console.log(err);
                    //console.log(err.data);
                    res.status(400).send('{'+err+'}');
                }else{

                    console.log('retornou 201 no inserteproduto');
                    //res.status(201).send(result.rows[0]);//se não realizar o send nao finaliza o client

                    res.status(201).send({"id":  result.rows[0].id,
                                          "nome": req.body.nome,
                                          "quantidade": req.body.quantidade,
                                          "tipo": req.body.tipo,
                                          "valor": req.body.valor,
                                          "fornecedor_cpf": req.body.fornecedor.cpf,
                                          "fornecedor": {
                                            "cpf" : req.body.fornecedor.cpf, 
                                            "cep": req.body.fornecedor.cep, 
                                            "complemento": req.body.fornecedor.complemento, 
                                            "data_nascimento": req.body.fornecedor.data_nascimento,
                                            "email": req.body.fornecedor.email,
                                            "endereco" : req.body.fornecedor.endereco,
                                            "nome" : req.body.fornecedor.nome,
                                            "numero_celular" : req.body.fornecedor.numero_celular,
                                            "rg" : req.body.fornecedor.rg,
                                            "senha" : req.body.fornecedor.senha,
                                            "cnpj": req.body.fornecedor.cnpj,
                                            "ie": req.body.fornecedor.ie,
                                          }
                                           });

                }           
            });
       }       
    });
});




//update produto
sw.post('/updateproduto', function (req, res, next) {
    
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Nao conseguiu acessar o  BD "+ err);
           res.status(400).send('{'+err+'}');
       }else{            

            var q1 ={
                text: 'update tb_produto set nome = $1, quantidade = $2, tipo = $3, valor = $4, fornecedor_cpf = $5 where id = $6 returning id, nome, quantidade, tipo, valor, fornecedor_cpf ',
                values: [ 
                         //req.body.pessoa.tipo,
                         req.body.nome, 
                         req.body.quantidade, 
                         req.body.tipo,
                         req.body.valor,
                         req.body.fornecedor_cpf, 
                         req.body.id,    
                        ]
            }
            
            console.log(q1);
            

            client.query(q1,function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log('retornou 400 no updateproduto');
                    
                    res.status(400).send('{'+err+'}');
                }else{

                    console.log('retornou 201 no updateproduto');
                    res.status(201).send({"id" : result.rows[0].id,
                                          "nome" : result.rows.nome,
                                          "quantidade" : result.rows.quantidade,
                                          "tipo" : result.rows.tipo,
                                          "valor" : result.rows.valor,
        /* não tendi essa linha*/         "fornecedor_cpf" : {"cpf": result.rows[0].nome} }); 
                }           
            });
       }       
    });
});


//delete produto
sw.get('/deleteproduto/:nome', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){
            console.log("Não conseguiu acessar o banco de dados"+ err);
            res.status(400).send('{'+err+'}');
        }else{
            
            var q1 ={
                text: 'delete from tb_produto where nome = $1',
                values: [req.params.nome]
            }
            /*
            var q1 ={
                text: 'delete from tb_fornecedor where cpf = $1',
                values: [req.params.cpf]
            }
            
            */
            client.query( q1 , function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send({'nome': req.params.nome});//retorna o nome deletado.
                }


            });
        } 
    });    
});

//Login Fornecedor
sw.post('/loginfornecedor', function (req, res, next) {
    
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Nao conseguiu acessar o  BD "+ err);
           res.status(400).send('{'+err+'}');
       }else{            

            var q ={
                text: 'select tb_pessoa.cpf, to_char(data_cadastro, \'yyyy-mm-dd\') as data_cadastro from tb_pessoa where tb_pessoa.cpf = $1 and tb_pessoa.senha = $2;',
                values: [req.body.cpf, req.body.senha]
            }
            console.log(q);
    
            client.query(q,function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log('retornou 400 pelo loginFornecedor');
                
                    res.status(400).send('{'+err+'}');
                }else{

                    if(result.rows.length > 0){

                        res.status(201).send({"cpf":  req.body.cpf, 'data_cadastro': result.rows[0].data_cadastro}) 
                    }else{

                        res.status(204).send();

                    }
                }           
            });
       }       
    });
});


