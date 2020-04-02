import { Public } from '@utils/public';
import { GoogleService } from '../auth/services/google.service';

export class MockGoogleService implements Public<GoogleService> {
  public getTicket = jest.fn();
}
