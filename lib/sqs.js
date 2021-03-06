const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.AWS_SQS_REGION });

/**
 * Class for using AWS SQS
 *
 * @class SQS
 */
class SQS {
  /**
   * Creates an instance of SQS.
   *
   * @param {Object} options Options
   * @param {function} options.handleMessage Function for message processing
   * @memberof SQS
   */
  constructor ({
    handleMessage
  }) {
    if (!handleMessage) {
      throw new Error('handleMessage method is not supplied');
    }

    this.handleMessage = handleMessage;
    this.sqs = new AWS.SQS();
    this.queueUrl = process.env.AWS_SQS_QUEUE_URL;

    this.receiveMessage();
  }

  /**
   * SQS message receiver
   *
   * @memberof SQS
   */
  async receiveMessage () {
    let message;
    try {
      message = await this.sqs.receiveMessage({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20
      }).promise();

      if (message.Messages) {
        const parsed = JSON.parse(message.Messages[0].Body);
        await this.handleMessage(parsed);
      }
    } catch (error) {
      console.error('Error processing message from SQS', error);
    } finally {
      if (message && message.Messages) {
        const res = await this.sqs.deleteMessage({
          QueueUrl: this.queueUrl,
          ReceiptHandle: message.Messages[0].ReceiptHandle
        }).promise();
        console.log(res);
      }
      this.receiveMessage();
    }
  }
}

module.exports = SQS;
