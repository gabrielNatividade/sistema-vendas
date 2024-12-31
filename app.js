const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const PORTA = 8080; // porta para o acesso ao servidor aomnia
const multer = require('multer'); // o multer facilita o processamento e o armazenamento de arquivos que são enviados para o servidor

const storage = multer.memoryStorage(); //local para armazenar os arquivos antes de processa-los
const upload = multer({ storage: storage }); // comfigurados com as opções fornecidas, ela é definida como objeto pois serve para armazenamento temporiariamente

const sequelize = new Sequelize('loja_gnds', 'root', 'codeclass', {
    host: 'localhost',//onde o banco de dados está sendo executado
    dialect: 'mariadb',
    port: 3307 //porta para o banco de dados
})

const router = express.Router();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());//passar no corpo da requisição

//Model de Fornecedor
const Fornecedores = sequelize.define('Fornecedores', {
    codigo: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fornecedor: {
        type: Sequelize.DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: Sequelize.DataTypes.STRING(40),
        allowNull: false,
    },
    telefone: {
        type: Sequelize.DataTypes.STRING(100),
        allowNull: false,
    }
})


//Model de Produtos

const Produtos = sequelize.define('Produtos', {
    codigo: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
    },
    produtos: {
        type: Sequelize.DataTypes.STRING(100),
        allowNull: false,
    },
    quantidade: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
    },
    preco: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    codigo_fornecedor: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: Fornecedores,
            key: 'codigo'
        }
    },
    imagem: {
        type: Sequelize.DataTypes.BLOB('long'),
        allowNull: true,
    }

});

// Model do usuario

const Usuarios = sequelize.define('Usuarios', {
    codigo: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario: {
        type: Sequelize.DataTypes.STRING(100),
        allowNull: false
    },
    senha: {
        type: Sequelize.DataTypes.STRING(20),
        allowNull: false
    },
});

//Rota para criar um novo usuario
router.post('/api/novoUsuario', async (req, res) => {
    try {
        const novoUsuario = await Usuarios.create({
            usuario: req.body.usuario,
            senha: req.body.senha,
        });
        res.status(201).json(novoUsuario)
    } catch (error) {
        console.error('Erro ao criar um novo Usuarios', error);
        res.status(500).json({ erro: 'Erro ao criar um novo Usuuario' });
    }
});

//Rota para autenticar o usuario (login)
router.post('/api/login', async (req, res) => {
    const { usuario, senha } = req.body;
    // const usuario = req.bory;
    // const senha = req.bory; 
    try {
        const usuarioAutenticado = await Usuarios.findOne({
            where: { usuario: usuario, senha: senha } // sera feito uma busca la na minha base de dados
        });

        if (!usuarioAutenticado) {
            return res.status(401).json({ error: 'Credenciais Inválidas' })
        }

        res.status(200).json({ mensagem: 'login bem-sucedido', usuario: usuarioAutenticado });
    } catch (error) {
        onsole.error('Erro ao autenticar o Usuarios', error);
        res.status(500).json({ erro: 'Erro ao autenticar o Usuuario' });
    }
});

// Rota para criar um novo Fornecedor
router.post('/api/novoFornecedor', async (req, res) => {
    try {
        const novoFornecedor = await Fornecedores.create({
            fornecedor: req.body.fornecedor,
            email: req.body.email,
            telefone: req.body.telefone,
        });

        res.status(201).json(novoFornecedor);
    } catch (error) {
        console.error('Erro ao criar novo Fornecedor:', error);
        res.status(500).json({ error: 'Erro ao criar novo Fornecedor' });

    }
});

//Rota para listar todos os fornecedores (APIS)
router.get('/api/fornecedores', async (req, res) => {
    try {
        const fornecedores = await Fornecedores.findAll();
        res.status(200).json(fornecedores);
    } catch (error) {
        console.error('Erro ao listar os fornecedores:', error);
        res.status(500).json({ error: 'Erro ao listar fornecedores' });

    }
});

// Rota para cosnultar um fornecedor pelo ID
router.get('/api/fornecedores/:id', async (req, res) => {
    try {
        const fornecedor = await Fornecedores.findByPk(req.params.id);
        if (!fornecedor) {
            return res.status(404).json({ error: 'Fornecedor não encontrado' });
        }
        res.status(200).json(fornecedor);
    } catch (error) {
        console.error('Erro ao consultar o fornecedor:', error);
        res.status(500).json({ error: 'Erro ao consultar o fornecedor' });
    }
});

// Rota par deletar um fornecedor pelo ID
router.delete('/api/fornecedores/:id', async (req, res) => {
    try {
        const fornecedor = await Fornecedores.findByPk(req.params.id);
        if (!fornecedor) { //tratativa
            return res.status(404).json({ error: 'Fornecedor não encontrado' })
        }
        await fornecedor.destroy();
        res.status(200).json({ mensagem: 'Fornecedor deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar o fornecedor:', error);
        res.status(500).json({ error: 'Erro ao deletar o fornecedor' });
    }
});

//Rota para atualização do fornecedor pelo ID
router.put('/api/fornecedores/:id', async (req, res) => {
    const { fornecedor, email, telefone } = req.body;// desestruturação de objeto    
    try {
        await Fornecedores.update(
            { fornecedor, email, telefone },
            {
                where: { codigo: req.params.id },
                returning: true,
            }
        );
        res.status(200).json({ mensagem: 'Fornecedor Atualizado com sucesso' })
    } catch (error) {
        console.error('Erro ao atualizar fornecedor', error);
        res.status(500).json({ error: 'Erro ao Atualizar o Fornecedor' })
    }
});

//Rota para criar um novo produto

router.post('/api/novoProduto', upload.single('imagem'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo de imagem enviado.' });
        }

        if (!req.file.buffer) {
            return res.status(400).json({ error: 'O arquivo de imagem está vazio.' })
        }

        const novoProduto = await Produtos.create({
            codigo: req.body.codigo,
            produtos: req.body.produtos,
            quantidade: req.body.quantidade,
            preco: req.body.preco,
            codigo_fornecedor: req.body.codigo_fornecedor,
            imagem: Buffer.from(req.file.buffer), //salva a imagem como um buffer
        });

        res.status(201).json(novoProduto);
    } catch (error) {
        console.error('Erro ao criar novo produto', error);
        res.status(500).json({ error: 'Erro ao criar novo produto' })
    }
});

//Rota para listar Produtos
router.get('/api/listarProdutos', async (req, res) => {
    try {
        const listarProdutos = await Produtos.findAll();
        res.status(201).json(listarProdutos);
    } catch (error) {
        console.error('Erro ao consultar produtos');
        res.status(500).json({ error: 'Erro ao consultar produtos' });
    }
});

//Rota para cosultar um produto por um ID
router.get('/api/produtos/:id', async (req, res) => {
    try {
        const produtos = await Produtos.findByPk(req.params.id);
        if (!produtos) {
            return res.status(404).json({ mensagem: 'Produto não encontrado' });
        }
        res.status(200).json(produtos);
    } catch (error) {
        console.error('Erro ao consultar produtos');
        res.status(500).json({ error: 'Erro ao consultar produtos' });
    }
});

//Rota para deletar um produto
router.delete('/api/produtos/:id', async (req, res) => {
    try {
        const produto = await Produtos.findByPk(req.params.id);

        if (!produto) {
            return res.status(404).json({ mensagem: 'Produtos não encontrado' });
        }

        await produto.destroy();
        res.status(200).json({ mensagem: 'Produto deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar o produtos');
        res.status(500).json({ error: 'Erro ao deletar produtos' });
    }
})

//Rota de atualização do produto
router.put('/api/produtos/:id', upload.single('imagem'), async (req, res) => {
    const { produtos, quantidade, preco, codigo_fornecedor, imagem } = req.body;//desestruturação do req body no formato jason
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo de imagem enviado.' });
        }

        if (!req.file.buffer) {
            return res.status(400).json({ error: 'O arquivo de imagem está vazio.' })
        }

        await Produtos.update(
            {
                produtos: req.body.produtos,
                quantidade: req.body.quantidade,
                preco: req.body.preco,
                codigo_fornecedor: req.body.codigo_fornecedor,
                imagem: Buffer.from(req.file.buffer) //salva a imagem como um buffer

            },
            {
                where: { codigo: req.params.id },
                returning: true
            }

        );
        res.status(200).json({ mensagem: 'Produto atualizado com sucesso!' })
    } catch (error) {
        console.error('Erro ao atualizar produto', error);
        res.status(500).json({ error: 'Erro ao atualizar produto' })
    }
})




app.use(router);
// Comentei a a linha de baixo, pois no meu banco de dados estava limpando a tabela produtos.
// Produtos.sync ({force: true});
app.listen(PORTA, () => {
    console.log('Servidor Rodando na porta', PORTA);
});










