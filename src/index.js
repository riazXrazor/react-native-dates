import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import moment from 'moment';
import 'moment-range';

type DatesType = {
  range: boolean,
  date: ?moment,
  startDate: ?moment,
  endDate: ?moment,
  focusedInput: 'startDate' | 'endDate',
  onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
  isDateBlocked: (date: moment) => boolean,
  onDisableClicked: (date: moment) => void,
  nextElement: ?any,
  prevElement: ?any,
  daySelectedStyle : ?any,
  daySelectedTextStyle: ?any
}

type MonthType = {
  range: boolean,
  date: ?moment,
  startDate: ?moment,
  endDate: ?moment,
  focusedInput: 'startDate' | 'endDate',
  currentDate: moment,
  focusedMonth: moment,
  onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
  isDateBlocked: (date: moment) => boolean,
  onDisableClicked: (date: moment) => void,
  daySelectedStyle : ?any,
  daySelectedTextStyle: ?any
}

type WeekType = {
  range: boolean,
  date: ?moment,
  startDate: ?moment,
  endDate: ?moment,
  focusedInput: 'startDate' | 'endDate',
  startOfWeek: moment,
  onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
  isDateBlocked: (date: moment) => boolean,
  onDisableClicked: (date: moment) => void,
  daySelectedStyle: ?any,
  daySelectedTextStyle: ?any
}

const styles = StyleSheet.create({
  calendar: {
    backgroundColor: 'rgb(255, 255, 255)'
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20
  },
  week: {
    flexDirection: 'row'
  },
  dayName: {
    flexGrow: 1,
    flexBasis: 1,
    textAlign: 'center',
  },
  day: {
    flexGrow: 1,
    flexBasis: 1,
    alignItems: 'center',
    backgroundColor: 'rgb(245, 245, 245)',
    margin: 1,
    padding: 10
  },
  dayBlocked: {
    backgroundColor: 'rgb(255, 255, 255)'
  },
  daySelected: {
    borderWidth: 1
  },
  dayText: {
    color: 'rgb(0, 0, 0)',
    fontWeight: '600'
  },
  dayDisabledText: {
    color: 'gray',
    opacity: 0.5,
    fontWeight: '400'
  },
  daySelectedText: {
    color: 'rgb(252, 252, 252)'
  }
});

const dates = (startDate: ?moment, endDate: ?moment, focusedInput: 'startDate' | 'endDate') => {
  if (focusedInput === 'startDate') {
    if (startDate && endDate) {
      return ({ startDate, endDate: null, focusedInput: 'endDate' });
    }
    return ({ startDate, endDate, focusedInput: 'endDate' });
  }

  if (focusedInput === 'endDate') {
    if (endDate && startDate && endDate.isBefore(startDate)) {
      return ({ startDate: endDate, endDate: null, focusedInput: 'endDate' });
    }
    return ({ startDate, endDate, focusedInput: 'startDate' });
  }

  return ({ startDate, endDate, focusedInput });
};

export const Week = (props: WeekType) => {
  const {
    range,
    date,
    startDate,
    endDate,
    focusedInput,
    startOfWeek,
    onDatesChange,
    isDateBlocked,
    onDisableClicked,
    daySelectedStyle,
    daySelectedTextStyle
  } = props;

  const days = [];
  const endOfWeek = startOfWeek.clone().endOf('isoweek');

  moment.range(startOfWeek, endOfWeek).by('days', (day: moment) => {
    const onPress = () => {
      if (isDateBlocked(day)) {
        onDisableClicked(day);
      } else if (range) {
        let isPeriodBlocked = false;
        const start = focusedInput === 'startDate' ? day : startDate;
        const end = focusedInput === 'endDate' ? day : endDate;
        if (start && end) {
          moment.range(start, end).by('days', (dayPeriod: moment) => {
            if (isDateBlocked(dayPeriod)) isPeriodBlocked = true;
          });
        }
        onDatesChange(isPeriodBlocked ?
          dates(end, null, 'startDate') :
          dates(start, end, focusedInput));
      } else {
        onDatesChange({ date: day });
      }
    };

    const isDateSelected = () => {
      if (range) {
        if (startDate && endDate) {
          return day.isSameOrAfter(startDate, 'day') && day.isSameOrBefore(endDate, 'day');
        }
        return (startDate && day.isSame(startDate, 'day')) || (endDate && day.isSame(endDate, 'day'));
      }
      return date && day.isSame(date, 'day');
    };

    const isBlocked = isDateBlocked(day);
    const isSelected = isDateSelected();

    const style = [
      styles.day,
      isBlocked && styles.dayBlocked,
      isSelected && styles.daySelected,
    ];

    if (isSelected && daySelectedStyle) {
      style.push(daySelectedStyle);
    }

    const styleText = [
      styles.dayText,
      isBlocked && styles.dayDisabledText,
      isSelected && styles.daySelectedText
    ];

    if (isSelected && daySelectedTextStyle) {
      style.push(daySelectedTextStyle);
    }


    days.push(
      <TouchableOpacity
        key={day.date()}
        style={style}
        onPress={onPress}
        disabled={isBlocked && !onDisableClicked}
      >
        <Text style={styleText}>{day.date()}</Text>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.week}>{days}</View>
  );
};

export const Month = (props: MonthType) => {
  const {
    range,
    date,
    startDate,
    endDate,
    focusedInput,
    currentDate,
    focusedMonth,
    onDatesChange,
    isDateBlocked,
    onDisableClicked,
    daySelectedStyle,
    daySelectedTextStyle
  } = props;

  const dayNames = [];
  const weeks = [];
  const startOfMonth = focusedMonth.clone().startOf('month').startOf('isoweek');
  const endOfMonth = focusedMonth.clone().endOf('month');
  const weekRange = moment.range(currentDate.clone().startOf('isoweek'), currentDate.clone().endOf('isoweek'));

  weekRange.by('days', (day: moment) => {
    dayNames.push(
      <Text key={day.date()} style={styles.dayName}>
        {day.format('ddd')}
      </Text>
    );
  });

  moment.range(startOfMonth, endOfMonth).by('weeks', (week: moment) => {
    weeks.push(
      <Week
        key={week}
        range={range}
        date={date}
        startDate={startDate}
        endDate={endDate}
        focusedInput={focusedInput}
        currentDate={currentDate}
        focusedMonth={focusedMonth}
        startOfWeek={week}
        onDatesChange={onDatesChange}
        isDateBlocked={isDateBlocked}
        onDisableClicked={onDisableClicked}
        daySelectedStyle={daySelectedStyle}
        daySelectedTextStyle={daySelectedTextStyle}
      />
    );
  });

  return (
    <View style={styles.month}>
      <View style={styles.week}>
        {dayNames}
      </View>
      {weeks}
    </View>
  );
};

export default class Dates extends Component {
  state = {
    currentDate: moment(),
    focusedMonth: moment().startOf('month')
  }

  componentWillMount() {
    const currentDate = moment(this.props.date);
    const focusedMonth = moment(this.props.date).startOf('month');

    this.setState({ currentDate, focusedMonth });
  }

  props: DatesType;

  render() {
    const previousMonth = () => {
      this.setState({ focusedMonth: this.state.focusedMonth.add(-1, 'M') });
    };

    const nextMonth = () => {
      this.setState({ focusedMonth: this.state.focusedMonth.add(1, 'M') });
    };

    return (
      <View style={styles.calendar}>
        <View style={styles.heading}>
          <TouchableOpacity onPress={previousMonth}>
            <View>{ !!this.props.prevElement ? this.props.prevElement : null }</View>
          </TouchableOpacity>
          <Text>{this.state.focusedMonth.format('MMMM')}</Text>
          <TouchableOpacity onPress={nextMonth}>
            <View>{ !!this.props.nextElement ? this.props.nextElement : null }</View>
          </TouchableOpacity>
        </View>
        <Month
          range={this.props.range}
          date={this.props.date}
          startDate={this.props.startDate}
          endDate={this.props.endDate}
          focusedInput={this.props.focusedInput}
          currentDate={this.state.currentDate}
          focusedMonth={this.state.focusedMonth}
          onDatesChange={this.props.onDatesChange}
          isDateBlocked={this.props.isDateBlocked}
          onDisableClicked={this.props.onDisableClicked}
          daySelectedStyle={this.props.daySelectedStyle}
          daySelectedTextStyle={this.props.daySelectedTextStyle}

        />
      </View>
    );
  }
}
