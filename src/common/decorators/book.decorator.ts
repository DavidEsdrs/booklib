import { ExecutionContext, Param, createParamDecorator } from "@nestjs/common";
import { BookIdToObjectPipe } from "../pipes/bookIdToObject.pipe";

export const BookInstance = (param: string) => Param(param, BookIdToObjectPipe);