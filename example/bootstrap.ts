import {DeepService} from './DeepService';
import {FirstService} from './FirstService';
import {SecondService} from './SecondService';
import {ServiceInterface} from './ServiceInterface';
import {Container} from '../src/index';


let container = new Container();
// register constructor params
container.register(DeepService, ["I'm deep service, with such a beautiful string!"]);
container.register(SecondService, ["I'm cool second service"]);

// bind interface to implementation
container.register(ServiceInterface, FirstService);


export default container;