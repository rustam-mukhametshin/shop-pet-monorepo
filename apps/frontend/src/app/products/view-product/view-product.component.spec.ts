import {ViewProductComponent} from "./view-product.component";
import {ActivatedRoute} from "@angular/router";
import {ProductsService} from "../products.service";
import {describe, beforeEach, it, expect} from "vitest";

describe("ViewProductComponent", () => {
  let component: ViewProductComponent;

  beforeEach(async () => {
    component = new ViewProductComponent(
      new ActivatedRoute(),
      new ProductsService(null as any, null as any),
      null as any,
    );
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
