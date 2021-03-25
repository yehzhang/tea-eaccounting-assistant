import bodyParser from 'koa-bodyparser';
import compress from 'koa-compress';
import Router from 'koa-router';

function useTranscodingMiddlewares(router: Router) {
  // Compresses the response.
  router.use(compress());

  // Parses the request.
  router.use(bodyParser());
}

export default useTranscodingMiddlewares;
