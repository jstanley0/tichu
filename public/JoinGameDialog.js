function JoinGameDialog(_props) {
  const { Container, Form, Button, Col } = ReactBootstrap

  const getName = () => {
    return document.getElementById('JoinGameDialog__Name').value
  }

  const startGame = () => {

  }
  const joinGame = () => {

  }

  return <Container fluid="md">
    <Form>
      <Form.Row className="m-2 mb-4 mt-5" >
        <Form.Control type="text" id="JoinGameDialog__Name" placeholder="Name"/>
      </Form.Row>
      <Form.Row>
        <Col md="auto">
          <Button className="m-2" onClick={startGame} variant="primary">Start Game</Button>
        </Col>
        <Col md={{offset: 1}}>
          <Form.Control className="m-2" type="text" id="JoinGameDialog__GameCode" placeholder="Game code"/>
        </Col>
        <Col md="auto">
          <Button className="m-2" onClick={joinGame} variant="primary">Join Game</Button>
        </Col>
      </Form.Row>
    </Form>
  </Container>
}