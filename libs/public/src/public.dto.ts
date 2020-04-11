import { IsString } from 'class-validator';

export class AskDto {
  @IsString()
  public email?: string;
  @IsString()
  public name?: string;
  @IsString()
  public content?: string;
}
