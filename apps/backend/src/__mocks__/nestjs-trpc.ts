// Mock for nestjs-trpc Router decorator
export const Router = () => {
  return (target: unknown) => {
    return target;
  };
};

export const Query = () => {
  return (target: unknown, key: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  };
};

export const Mutation = () => {
  return (target: unknown, key: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  };
};

export const TRPCModule = {
  forRoot: () => ({
    module: class TRPCModuleMock {},
    providers: [],
  }),
};
