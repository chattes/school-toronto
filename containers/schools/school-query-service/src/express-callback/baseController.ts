import * as express from 'express';
export type HttpRequestType = {
  body: any;
  query: any;
  params: any;
  ip: string;
  method: string;
  path: string;
  headers: any;
};
export abstract class BaseController {
  protected abstract executeImpl(
    req: HttpRequestType,
    res: express.Response
  ): Promise<void | any>;

  public async execute(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    try {
      const httpRequest: HttpRequestType = {
        body: req.body,
        query: req.query,
        params: req.params,
        ip: req.ip,
        method: req.method,
        path: req.path,
        headers: {
          'Content-Type': req.get('Content-Type'),
          Referer: req.get('referer'),
          'User-Agent': req.get('User-Agent')
        }
      };
      await this.executeImpl(httpRequest, res);
    } catch (error) {
      console.error('BaseController:: An unknown error has occured');
      this.fail(res, error);
    }
  }

  public static jsonResponse(
    res: express.Response,
    code: number,
    message: string
  ): express.Response {
    return res.status(code).json({ message });
  }

  public ok<T>(res: express.Response, dto?: T): express.Response {
    if (dto) {
      res.type('application/json');
      return res.status(200).json(dto);
    } else {
      return res.sendStatus(200);
    }
  }

  public created(res: express.Response): express.Response {
    return res.sendStatus(201);
  }

  public clientError(
    res: express.Response,
    message?: string
  ): express.Response {
    return BaseController.jsonResponse(
      res,
      400,
      message ? message : 'Unauthorized'
    );
  }

  public unauthorized(
    res: express.Response,
    message?: string
  ): express.Response {
    return BaseController.jsonResponse(
      res,
      401,
      message ? message : 'Unauthorized'
    );
  }

  public paymentRequired(
    res: express.Response,
    message?: string
  ): express.Response {
    return BaseController.jsonResponse(
      res,
      402,
      message ? message : 'Payment required'
    );
  }

  public forbidden(res: express.Response, message?: string): express.Response {
    return BaseController.jsonResponse(
      res,
      403,
      message ? message : 'Forbidden'
    );
  }

  public notFound(res: express.Response, message?: string): express.Response {
    return BaseController.jsonResponse(
      res,
      404,
      message ? message : 'Not found'
    );
  }

  public conflict(res: express.Response, message?: string): express.Response {
    return BaseController.jsonResponse(
      res,
      409,
      message ? message : 'Conflict'
    );
  }

  public tooMany(res: express.Response, message?: string): express.Response {
    return BaseController.jsonResponse(
      res,
      429,
      message ? message : 'Too many requests'
    );
  }

  public todo(res: express.Response): express.Response {
    return BaseController.jsonResponse(res, 400, 'TODO');
  }

  fail(res: express.Response, error: Error | string): express.Response {
    return res.status(500).json({ message: error.toString() });
  }
}
