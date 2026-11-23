import {createDeliveryHealthHandler} from '../lib/inquiry-delivery-health.mjs';
export default createDeliveryHealthHandler({outbox:async env=>(await import('../lib/headquarters-capture.mjs')).websiteOutbox(env)});
