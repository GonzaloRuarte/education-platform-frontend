import { toCamelCase } from '@/shared/utils';

class RouteBuilder {
  private path: string = '';
  private label: string = '';
  private subnodes: RouteBuilder[] = [];

  root(options: { nodes: RouteBuilder[], basepath?: string }) {
    this.subnodes = options.nodes
    if (options?.basepath) {
      this.path = options.basepath
    }
    this.subnodes = options.nodes
    return this
    // return Object.fromEntries(nodes.map(node => [node.label, node.build()]))
  }

  node(label: string, path: string, options?: { subnodes?: RouteBuilder[] }): RouteBuilder {
    const node = new RouteBuilder();
    node.path = path;
    node.label = label;
    if (options?.subnodes) {
      node.subnodes = options.subnodes;
    }
    return node;
  }

  build(parentPath?: string): any {
    const result: any = {
      path: parentPath === undefined ? this.path : `${parentPath}${this.path}`,
      label: this.label,
    };
    if (this.subnodes.length > 0) {
      result._ = Object.fromEntries(
        this.subnodes.map((sn) => [toCamelCase(sn.label), sn.build(result.path)])
      );
    }
    return result;
  }

  buildRoute(): any {
    return Object.fromEntries(this.subnodes.map((sn) => [toCamelCase(sn.label), sn.build(this.path)]))

  }
}
export default RouteBuilder