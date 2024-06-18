import React from "react";
import Swal from 'sweetalert2'; // Для всплывающих окон

const start = {
  active: false,
  speed: 120, // ms
  direction: "right",
  snake: [[50, 70], [60, 70], [70, 70], [80, 70]], 
  food: [200, 70],
  score: 0,
  high_score: localStorage.getItem("high_score") || 0,
  walls: [], // Стены, которые не пропускают змейку
  passableWalls: [], // Стены, через которые может проходить змейка
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {...start};
  }

  startStop = manual => {
    let active = this.state.active;
    if (manual) {
      this.setState({ active: !active });
    }
    if (!active) {
      this.interval = setInterval(() => this.updateSnake(), this.state.speed);
    } else {
      clearInterval(this.interval);
      let high_score = this.state.high_score;
      if (this.state.score > high_score) {
        high_score = this.state.score;
      }
      localStorage.setItem("high_score", high_score);
      this.setState({
        active: false,
        speed: 120, // ms
        direction: "right",
        snake: [[50, 70], [60, 70], [70, 70], [80, 70]], 
        food: [200, 70],
        score: 0,
        high_score: high_score
      });
    }
  };

  gameOver = () => {
    // Останавливаем игру
    clearInterval(this.interval);
  
    // Обновляем рекорд, если текущий счет выше
    const high_score = Math.max(this.state.high_score, this.state.score);
    localStorage.setItem("high_score", high_score);
  
    // Отображаем сообщение о конце игры
    Swal.fire({
      title: 'Игра окончена!',
      text: `Ваш счет: ${this.state.score}. Хотите сыграть еще раз?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Повторить',
      cancelButtonText: 'Завершить'
    }).then((result) => {
      if (result.value) {
        // Сбрасываем состояние игры к начальному
        this.setState({...start, high_score});
        // Запускаем игру заново
        this.startStop(false);
      } else {
        Swal.fire(
          'Спасибо за игру!',
          'Кликните на "Enter" для начала игры'
        )
      }
    });
  }

  updateSnake = () => {
    const direction = this.state.direction;
    const currentSnake = this.state.snake;
    const snakeHead = currentSnake[currentSnake.length - 1];
    let newHead = [];
    const target = this.state.food;
    switch (direction) {
      case "up":
        newHead = [snakeHead[0], snakeHead[1] - 10];
        break;
      case "right":
        newHead = [snakeHead[0] + 10, snakeHead[1]];
        break;
      case "down":
        newHead = [snakeHead[0], snakeHead[1] + 10];
        break;
      case "left":
        newHead = [snakeHead[0] - 10, snakeHead[1]];
        break;
      default:
        newHead = [snakeHead[0], snakeHead[1]];
    }
    currentSnake.push(newHead);
  
    // Проверка достижения границ поля
    if (
      newHead[0] >= 400 || // Правая граница
      newHead[0] < 0 ||    // Левая граница
      newHead[1] >= 330 || // Нижняя граница
      newHead[1] < 30      // Верхняя граница
    ) {
      this.gameOver();
      return; // Завершаем функцию, чтобы предотвратить дальнейшее выполнение кода
    }
  
    // Проверка столкновения со стенами
    this.state.walls.forEach(wall => {
      if (newHead[0] === wall[0] && newHead[1] === wall[1]) {
        this.gameOver();
        return; // Завершаем функцию, если произошло столкновение со стеной
      }
    });
  
    // Проверка столкновения с самим собой
    currentSnake.forEach((val, i, array) => {
      if (i != array.length - 1 && val.toString() == newHead.toString()) {
        this.gameOver();
        return; // Завершаем функцию, если змейка столкнулась сама с собой
      }
    });
  
    // Проверка съедания еды
    if (newHead[0] == target[0] && newHead[1] == target[1]) {
      let posX = Math.floor(Math.random() * (380 - 10 + 1)) + 10;
      let posY = Math.floor(Math.random() * (280 - 40 + 1)) + 40;
      posX = Math.ceil(posX / 10) * 10;
      posY = Math.ceil(posY / 10) * 10;
  
      let wallX = Math.floor(Math.random() * (380 - 10 + 1)) + 10;
      let wallY = Math.floor(Math.random() * (280 - 40 + 1)) + 40;
      wallX = Math.ceil(wallX / 10) * 10;
      wallY = Math.ceil(wallY / 10) * 10;
  
      this.setState(prevState => ({
        snake: currentSnake,
        food: [posX, posY],
        walls: [...prevState.walls, [wallX, wallY]],
        score: prevState.score + 1
      }));
    } else {
      // Если еда не съедена, удаляем последний элемент из хвоста змейки
      currentSnake.shift();
      this.setState({ snake: currentSnake });
    }
  }
  
  handleKeys = event => {
    let currentD = this.state.direction;

    if (event.keyCode === 13) {
      this.startStop(true);
    }
    if (event.keyCode === 65 && currentD != "right") {
      this.setState({ direction: "left" });
    }
    if (event.keyCode === 68 && currentD != "left") {
      this.setState({ direction: "right" });
    }
    if (event.keyCode === 87 && currentD != "down") {
      this.setState({ direction: "up" });
    }
    if (event.keyCode === 83 && currentD != "up") {
      this.setState({ direction: "down" });
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeys);
    if (this.state.active) {
      this.startStop(false);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeys);
    clearInterval(this.interval);
  }

  render() {
    const theSnake = this.state.snake;
    const food = this.state.food;
    const walls = this.state.walls; // Для отображения стен
    return (
      <React.Fragment>
        <Menu active={this.state.active} />
        <Score score={this.state.score} high_score={this.state.high_score} />
        {theSnake.map((val, i) => (
          <Part
            key={i}
            transition={this.state.speed}
            direction={this.state.direction}
            top={val[1]}
            left={val[0]}
          />
        ))}
        <Food top={food[1]} left={food[0]} />
        {walls.map((wall, i) => (
          <Wall key={`wall-${i}`} top={wall[1]} left={wall[0]} />
        ))}
        {this.state.passableWalls.map((wall, i) => (
          <PassableWall key={`passable-${i}`} top={wall[1]} left={wall[0]} />
        ))}
      </React.Fragment>
    );
  }
}

class Score extends React.Component {
  render() {
    return (
      <div className="score">
        <span>
          Счет: <strong>{this.props.score}</strong>
        </span>
        <span>
          Максимальный счет: <strong>{this.props.high_score}</strong>
        </span>
      </div>
    );
  }
}

class Part extends React.Component {
  render() {
    const classes = "part " + this.props.direction;
    return (
      <article
        style={{
          transition: this.props.transition + 50 + "ms",
          top: this.props.top + "px",
          left: this.props.left + "px"
        }}
        className={classes}
      />
    );
  }
}

class Food extends React.Component {
  render() {
    return (
      <div
        style={{ top: this.props.top + "px", left: this.props.left + "px" }}
        className="food"
      />
    );
  }
}

class Menu extends React.Component {
  render() {
    const menu_list = this.props.active ? "menu hidden" : "menu";
    return (
      <div className={menu_list}>
        Нажмите <span>enter</span> чтобы начать<br />
        Используйте кнопки <span>W</span>, <span>A</span>, <span>S</span>, <span>D</span> чтобы двигаться
      </div>
    );
  }
}

class Wall extends React.Component { // Компонент для непропускающих стен
  render() {
    return (
      <div
        style={{ top: this.props.top + "px", left: this.props.left + "px" }}
        className="wall"
      />
    );
  }
}

class PassableWall extends React.Component { // Компонент для пропускающих стен
  render() {
    return (
      <div
        style={{ top: this.props.top + "px", left: this.props.left + "px" }}
        className="passable-wall"
      />
    );
  }
}

export default App;