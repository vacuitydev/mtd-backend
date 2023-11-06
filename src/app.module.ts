import { Module } from '@nestjs/common';
import { ConverterModule } from './converter/converter.module';
import { DebugController } from './debug/debug.controller';
import { DebugModule } from './debug/debug.module';

@Module({
  imports: [ConverterModule, DebugModule],
  controllers: [ DebugController],
  providers: [],
})
export class AppModule {}
