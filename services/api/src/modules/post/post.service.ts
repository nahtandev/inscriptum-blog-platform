import { Injectable } from "@nestjs/common";

@Injectable()
export class PostService {
  async getAllPost() {
    return ["Post1", "Post2"];
  }

  async getPost() {
    return "Post1";
  }
}
