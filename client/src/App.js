import React, { Component } from "react";
import axios from "axios";
import * as _ from "lodash";
import "../src/App.css";

class App extends Component {
  state = {
    studentId: null,
    loggedIn: false,
    studentInfo: null,
    classList: null,
    professionList: null,
    chosenProfession: undefined,
    recommendedClassList: null
  };

  componentDidMount() {
    axios.post("/careerList", this.state.studentId).then(res => {
      this.setState({
        professionList: res.data,
        chosenProfession: res.data[0].id
      });
    });
  }

  updateLogin = event => {
    this.setState({ studentId: event.target.value });
  };

  updateJob = event => {
    this.setState({ chosenProfession: event.target.value });
  };

  updateDropdown(event) {
    this.setState({ chosenProfession: event.target.value });
  }

  handleLogin() {
    if (this.state.studentId === null) {
      this.setState({ studentId: undefined });
    } else {
      let req = {
        id: this.state.studentId
      };
      axios.post("/login", req).then(res => {
        if (res.data.length === 0) {
          this.setState({ studentId: undefined });
        } else {
          this.setState({
            classList: res.data,
            loggedIn: true
          });
        }
      });
    }
  }

  handeSuggestClasses() {
    const req = {
      chosenProfession: this.state.chosenProfession,
      studentId: this.state.studentId
    };
    axios.post("/suggestClasses", req).then(res => {
      console.log(res.data);
      this.setState({
        recommendedClassList: res.data
      });
    });
  }

  render() {
    if (!this.state.loggedIn) {
      return (
        <div>
          <label>Please enter your student ID</label>
          <input onBlur={this.updateLogin.bind(this)} />
          <button onClick={this.handleLogin.bind(this)}>Submit</button>
          <div>
            {this.state.studentId === undefined ? (
              <div className="error">
                <h1>Invalid ID</h1>
                <h1>Please Renter</h1>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <p>Welcome {this.state.classList[0].name}</p>
          <ul>
            <div>
              <strong>You have taken the following classes</strong>
            </div>
            {_.map(this.state.classList, item => (
              <li key={item.courseid + item.grade} className="classList">
                <div>{item.courseid}</div> <div>{item.title}</div>
                <div>{item.grade}</div>
              </li>
            ))}
          </ul>
          <label>Specify Desired Career</label>
          <select onChange={this.updateDropdown.bind(this)}>
            {_.map(this.state.professionList, option => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
          <button onClick={this.handeSuggestClasses.bind(this)}>
            Request Class Suggestions
          </button>

          <div>
            {this.state.recommendedClassList === null ? (
              <div />
            ) : (
              <div>
                {this.state.recommendedClassList.length === 0 ? (
                  <div>
                    You have taken all necessary classes to graduate and for
                    your chosen profession
                  </div>
                ) : (
                  <div>
                    <p>I would recommend taking the following classes</p>
                    <ul>
                      {_.map(this.state.recommendedClassList, item => (
                        <li key={item.id + item.requires} className="classList">
                          <div>{item.id}</div> <div>{item.title}</div>{" "}
                          <div>
                            {"Preq: " +
                              item.requires +
                              " with a " +
                              item.minimumgrade +
                              " or better."}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
  }
}
export default App;
