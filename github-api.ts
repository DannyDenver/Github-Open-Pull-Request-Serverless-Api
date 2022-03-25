import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import axios, { AxiosResponse } from 'axios';
import OpenPullRequest from "./models";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let  body;
    let statusCode = 200;
    const headers = {
      'Access-Control-Allow-Origin': '*'
    }
    try {
      switch (event.httpMethod) {
        case 'GET':
          if (event.pathParameters && event.pathParameters.owner && event.pathParameters.repo) {
            const result = await axios.get(`https://api.github.com/repos/${event.pathParameters.owner}/${event.pathParameters.repo}/pulls?state=opened`, {  headers })
              .then((pullRequests: AxiosResponse) => pullRequests.data)
              .then(async (pullRequests: any[]) => {
                  const requests = pullRequests
                                      .map(pull => axios
                                                      .get(`https://api.github.com/repos/${event.pathParameters && event.pathParameters.owner}/${event.pathParameters && event.pathParameters.repo}/pulls/${pull.number}`,
                                                          { headers }));
                  return await axios
                      .all(requests)
                      .then(axios.spread((...data) => {
                          return data.map((d:any, i:number) => 
                              new OpenPullRequest(
                                  +pullRequests[i].id,
                                  +pullRequests[i].number,
                                  pullRequests[i].title,
                                  pullRequests[i].user.login,
                                  +d.data.commits
                              )
                          )}
                      ));
                    }); 
                body = JSON.stringify(result);
          break;
          };

        default:
          throw new Error(`Unsupported method "${event.httpMethod}"`);    
      }
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error
        })
      }
    } finally {
      body = JSON.stringify(body);
    }
  
    return {
      statusCode, 
      body,
      headers
    }
  }