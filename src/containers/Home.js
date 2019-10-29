import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./Home.css";

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      items: []
    };
  }

  async componentDidMount() {
    try {
      // Extract saved json items
      const items = this.getItems();

      this.setState({ items });
    } catch (e) {
      alert("error: " + e);
    }

    this.setState({ isLoading: false });
  }

  getItems() {
    // Demo data change for real json generated.
    return [
      {
        itemId: 1,
        itemName: "Coca Cola",
        itemQuantity: 1
      },
      {
        itemId: 1,
        itemName: "Pepsi",
        itemQuantity: 1
      }
    ];
  }

  renderItemsList(items) {
    return [{}].concat(items).map((item, i) =>
      i !== 0 ? (
        <LinkContainer key={item.itemId} to={`/items/${item.itemId}`}>
          <ListGroupItem header={item.itemName.trim().split("\n")[0]}>
            {"Quantity: " + item.itemQuantity}
          </ListGroupItem>
        </LinkContainer>
      ) : null
    );
  }

  renderLander() {
    return (
      <div className="lander">
        <h1>Transfer learning</h1>
        <p>Product recognition</p>
      </div>
    );
  }

  renderitems() {
    return (
      <div className="items">
        <PageHeader>Scan new product</PageHeader>

        <PageHeader>Shopping cart</PageHeader>

        <ListGroup>
          {!this.state.isLoading && this.renderItemsList(this.state.items)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderitems() : this.renderLander()}
      </div>
    );
  }
}
