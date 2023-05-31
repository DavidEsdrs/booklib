import { ExecutionContext, Param, createParamDecorator } from "@nestjs/common";
import { LibraryIdToObjectPipe } from "../pipes/libraryIdToObject.pipe";

export const LibraryInstance = (param: string) => Param(param, LibraryIdToObjectPipe);