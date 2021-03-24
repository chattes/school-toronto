export interface UseCases<IRequest, IResponse> {
  execute(request: IRequest): Promise<IResponse> | IResponse;
}
