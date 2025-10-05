import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'esperabas un Hello World!? jajaja';
  }
}
