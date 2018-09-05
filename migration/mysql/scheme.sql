create table message (
  ID int(11) unsigned not null auto_increment,
  Message varchar(1024) not null default '',
  UserID varchar(36) not null default '',
  IsSystem tinyint(1) not null defaul 0,
  CreatedDate datetime not null default NOW(),

  primary key(id)
) ENGINE=InnoDB CHARACTER SET=utf8;