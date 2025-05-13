const getChipProps = (props: any) => {
  const { key, ...chipProps } = props;
  return { chipProps, key };
};

const getListItemProps = (props: any) => {
  const { key, ...listItemProps } = props;
  return { listItemProps, key };
};

<Autocomplete
  multiple
  options={options}
  value={selectedOptions}
  onChange={handleChange}
  renderTags={(value, getTagProps) =>
    value.map((option, index) => {
      const { chipProps, key } = getChipProps(getTagProps({ index }));
      return (
        <Chip
          key={key}
          {...chipProps}
          label={option.name}
        />
      );
    })
  }
  renderOption={(props, option) => {
    const { listItemProps, key } = getListItemProps(props);
    return (
      <li key={key} {...listItemProps}>
        {option.name}
      </li>
    );
  }}
/> 