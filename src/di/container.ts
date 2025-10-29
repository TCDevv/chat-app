import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';
import { MessageService } from '@services/MessageService';
import { LocalStorageService } from '@services/LocalStorageService';
import { PostMessageService } from '@services/PostMessageService';
import type { IMessageService } from '@services/interfaces/IMessageService';
import type { ILocalStorageService } from '@services/interfaces/ILocalStorageService';
import type { IPostMessageService } from '@services/interfaces/IPostMessageService';

const container = new Container();

container.bind<ILocalStorageService>(TYPES.LocalStorageService).to(LocalStorageService).inSingletonScope();
container.bind<IMessageService>(TYPES.MessageService).to(MessageService).inSingletonScope();
container.bind<IPostMessageService>(TYPES.PostMessageService).to(PostMessageService).inSingletonScope();

export { container };
