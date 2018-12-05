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
    recommendedClassList: null,
    neededClassList: null,
    singleSemester: true,
    preqList: null
  };

  componentDidMount() {
    axios.post("/careerList", this.state.studentId).then(res => {
      this.setState({
        professionList: res.data,
        chosenProfession: res.data[0].id
      });
    });
    axios.post("/preqList", null).then(res => {
      let updatePreqList = [];
      for (let i = 0; i < res.data.length; i++) {
        let sum = 0;
        if (res.data[i].initial !== null) sum += res.data[i].initial;
        if (res.data[i].secondary !== null) sum += res.data[i].secondary;
        if (res.data[i].third !== null) sum += res.data[i].third;

        updatePreqList.push({
          id: res.data[i].requires,
          priority: sum
        });
      }

      updatePreqList = _.orderBy(updatePreqList, "priority", "desc");
      this.setState({
        preqList: updatePreqList
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

  handleAllClassesNeeded() {
    const req = {
      chosenProfession: this.state.chosenProfession,
      studentId: this.state.studentId
    };
    axios.post("/allClassesNeeded", req).then(res => {
      this.setState({
        neededClassList: res.data
      });
    });
  }

  handleSuggestClasses() {
    const req = {
      chosenProfession: this.state.chosenProfession,
      studentId: this.state.studentId
    };
    axios.post("/suggestClasses", req).then(res => {
      this.suggestSemesterClasses(res.data);
    });
  }

  suggestSemesterClasses(classList) {
    let semesterSchedule = [];
    let index = 0;
    for (let i = 0; i < classList.length; i++) {
      let priority = 0;
      let preqClass = _.find(this.state.preqList, temp => {
        return temp.id === classList[i].id;
      });

      if (preqClass !== undefined) priority = preqClass.priority;

      //   if (preqClass !== undefined) priority = preqClass.priority;

      if (semesterSchedule.length === 0) {
        semesterSchedule.push({
          id: classList[i].id,
          title: classList[i].title,
          preq: [],
          priority: priority
        });
        semesterSchedule[index].preq.push(classList[i].requires);
      } else if (semesterSchedule[index].id === classList[i].id) {
        semesterSchedule[index].preq.push(classList[i].requires);
      } else {
        semesterSchedule.push({
          id: classList[i].id,
          title: classList[i].title,
          preq: [],
          priority: priority
        });
        semesterSchedule[index].preq.push(classList[i].requires);
        semesterSchedule[index].priority = priority;
        index++;
      }
    }

    semesterSchedule = _.orderBy(semesterSchedule, "priority", "desc");

    semesterSchedule = _.take(semesterSchedule, 5);

    this.setState({
      recommendedClassList: semesterSchedule
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
          <div>
            <label>Specify Desired Career</label>
            <select onChange={this.updateDropdown.bind(this)}>
              {_.map(this.state.professionList, option => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>
          <button onClick={this.handleAllClassesNeeded.bind(this)}>
            All Classes Needed
          </button>
          <div>
            {this.state.neededClassList === null ? (
              <div />
            ) : (
              <div>
                {this.state.neededClassList.length === 0 ? (
                  <div>
                    You have taken all necessary classes to graduate and for
                    your chosen profession
                  </div>
                ) : (
                  <div>
                    <ul>
                      <div>
                        <strong>
                          You will need the following to graduate.
                        </strong>
                      </div>
                      {_.map(this.state.neededClassList, item => (
                        <li key={item.id + item.requires} className="classList">
                          <div>{item.id}</div> <div>{item.title}</div>{" "}
                          <div>
                            {item.requires !== null ? (
                              <div>
                                {"Preq: " +
                                  item.requires +
                                  " with a " +
                                  item.minimumgrade +
                                  " or better."}
                              </div>
                            ) : (
                              <div />
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <button onClick={this.handleSuggestClasses.bind(this)}>
            Request Semester Suggestions
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
                    <ul>
                      {" "}
                      <div>
                        <strong>
                          I would recommend taking the following classes next
                          semester
                        </strong>
                      </div>
                      {_.map(this.state.recommendedClassList, item => (
                        <li key={item.id + item.requires} className="classList">
                          <div>{item.id}</div> <div>{item.title}</div>{" "}
                          <div>
                            {item.requires !== null ? (
                              <div>{"Preq: " + item.preq}</div>
                            ) : (
                              <div />
                            )}
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
