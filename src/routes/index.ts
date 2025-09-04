// src/routes/index.ts
import { Router, Request, Response } from 'express';
import { IndexController } from '../controllers/IndexController';
import { PostController } from '../controllers/PostController';
import { PostsController } from '../controllers/PostsController';
import { CategoryController } from '../controllers/CategoryController';
import { PostCreateController } from '../controllers/PostCreateController';
import { CategoryCreateController } from '../controllers/CategoryCreateController';
import { TagCreateController } from '../controllers/TagCreateController';

const router = Router();

//exec controllers
const executeController = (ControllerClass: any) => {
  return async (req: Request, res: Response) => {
    try {
      const controller = new ControllerClass(req, res);
      await controller.execute();
    } catch (error) {
      console.error('Erro na rota:', error);
      res.status(500).send('Erro interno do servidor');
    }
  };
};

// //rota pagina inciial
router.get('/', executeController(IndexController));

// //rota dos posts
router.get('/posts', executeController(PostsController));
router.get('/post/:slug', executeController(PostController));

// // rota categorias
router.get('/category/:slug', executeController(CategoryController));

// // get forms
router.get('/create/post', executeController(PostCreateController));
router.get('/create/category', executeController(CategoryCreateController));
router.get('/create/tag', executeController(TagCreateController));

// // post forms
router.post('/create/post', executeController(PostCreateController));
router.post('/create/category', executeController(CategoryCreateController));
router.post('/create/tag', executeController(TagCreateController));


router.get('/search', async (req: Request, res: Response) => {
  
  res.send('Busca...');
});

// // erro 404
// router.use('*', (req: Request, res: Response) => {
//   res.status(404).send('Página não encontrada');
// });

export default router;