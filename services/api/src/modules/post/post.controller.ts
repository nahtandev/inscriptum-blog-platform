import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { PostService } from "./post.service";

@Controller("post")
@UseGuards(AuthGuard)
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  async getAllPost() {
    return await this.postService.getAllPost();
  }

  @Get(":publicId")
  async getPost() {
    return await this.postService.getPost();
  }
}
