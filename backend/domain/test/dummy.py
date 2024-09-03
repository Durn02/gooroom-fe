CREATE_DUMMY_NODES_QUERY = """
UNWIND [
  {
    email: 'test1@gooroom.com', password: '$2b$12$K4kuDTzku5n.xyXYd45lUODLIZH5FGHY7upzFAGie20nQkG8iTibS', username: 'test1', nickname: 'dudu02', node_id: randomUUID(), pd_node_id: randomUUID()
  },
  {
    email: 'test2@gooroom.com', password: '$2b$12$3yEYh6B/3gx39oLwrvWeOeIAnGPq8sjOuQ66IjHZC09RoVScMJ9J.', username: 'test2', nickname: 'kong123', node_id: randomUUID(), pd_node_id: randomUUID()
  },
  {
    email: 'test3@gooroom.com', password: '$2b$12$Qj9ewqKNxfyBA9VXF3bIB.Lvcub7IvsoyGxIZzq/I32kHrM37HL22', username: 'test3', nickname: 'cdh07', node_id: randomUUID(), pd_node_id: randomUUID()
  },
  {
    email: 'test4@gooroom.com', password: '$2b$12$WXLGKvtJoAuTeRlKIXA19uyoP3joLDcP0okXfgPlJhhHwMuP5vH0q', username: 'test4', nickname: 'kms11', node_id: randomUUID(), pd_node_id: randomUUID()
  },
  {
    email: 'test5@gooroom.com', password: '$2b$12$R8HZuNkjv/.tv0YbBImAB.HkECyd91/1KPYQJjiE7WYXHu5fD.Dmu', username: 'test5', nickname: 'kuku', node_id: randomUUID(), pd_node_id: randomUUID()
  },
  {
    email: 'test6@gooroom.com', password: '$2b$12$EqY6.3AiNFCQgbreIm0k5.nrfNhUhJEeBUEN6Z5z.mdfNNEeQh7H.', username: 'test6', nickname: '컴붕1', node_id: randomUUID(), pd_node_id: randomUUID()
  },
  {
    email: 'test7@gooroom.com', password: '$2b$12$ufPaFUac0EkoWruEEezs6uCANAW/NfS1oEqHmq0zpb8bolhu/ZWHG', username: 'test7', nickname: 'lsh00', node_id: randomUUID(), pd_node_id: randomUUID()
  },
  {
    email: 'test8@gooroom.com', password: '$2b$12$AAbjWTevE99xJT9btK52IeG11wDFeyjPGsM8kOOTt18qcou.JfNb6', username: 'test8', nickname: 'room32', node_id: randomUUID(), pd_node_id: randomUUID()
  },
  {
    email: 'test9@gooroom.com', password: '$2b$12$wqKLyE5cdHMeT5skLVi2R.0P5ER13ALnj2kB1hqfFGRkFeo8pY/.y', username: 'test9', nickname: 'gitgit90', node_id: randomUUID(), pd_node_id: randomUUID()
  },
  {
    email: 'test10@gooroom.com', password: '$2b$12$TayohjpoDRfzTKQTI1SLxuwr0NBDoV08HL4Skar.xaycPTEwrmT/C', username: 'test10', nickname: 'grem1in', node_id: randomUUID(), pd_node_id: randomUUID()
  },
  {
    email: 'test11@gooroom.com', password: '$2b$12$L44lvW6hWEGsk0OiwE3nSOErOrAkNGqlZ48NXyp1TZ.p7U56Np4Um', username: 'test11', nickname: 'ku-ec2-user', node_id: randomUUID(), pd_node_id: randomUUID()
  },
  {
    email: 'test12@gooroom.com', password: '$2b$12$fT4gHYAGUnMnAgyNIVZTsuVibne/aFvQsPkcZ2KnpKObruWLjCCcG', username: 'test12', nickname: 'goo1', node_id: randomUUID(), pd_node_id: randomUUID()
  },
  {
    email: 'test13@gooroom.com', password: '$2b$12$fzsINBjqjhfYsjBfo8NsluOtEAEhLOewll2AnuuBlqAcqsETXyDue', username: 'test13', nickname: 'young_tiger', node_id: randomUUID(), pd_node_id: randomUUID()
  }
] AS data

OPTIONAL MATCH (existingUser:User {username: data.username})
WITH existingUser, data
CALL apoc.do.when(
  existingUser IS NOT NULL,
  'RETURN "data already exists" AS message',
  '
    CREATE (pd:PrivateData {
      email: data.email,
      password: data.password,
      username: data.username,
      link_info: "",
      verification_info: "",
      link_count: 0,
      verification_count: 0,
      grant: "verified",
      node_id: data.pd_node_id
    })
    CREATE (u:User {
      username: data.username,
      nickname: data.nickname,
      concern: ["string"],
      my_memo: "",
      node_id: data.node_id
    })
    CREATE (pd)-[:is_info]->(u)
    RETURN "success" AS message
  ',
  {data: data}
) YIELD value
RETURN value.message
"""


CREATE_DUMMY_EDGES_QUERY = """
MATCH (u1:User {nickname: 'dudu02'})
MATCH (u2:User {nickname: 'kong123'})
MATCH (u3:User {nickname: 'cdh07'})
MATCH (u4:User {nickname: 'kms11'})
MATCH (u5:User {nickname: 'kuku'})
MATCH (u6:User {nickname: '컴붕1'})
MATCH (u7:User {nickname: 'lsh00'})
MATCH (u8:User {nickname: 'room32'})
MATCH (u9:User {nickname: 'gitgit90'})
MATCH (u10:User {nickname: 'grem1in'})
MATCH (u11:User {nickname: 'ku-ec2-user'})
MATCH (u12:User {nickname: 'goo1'})
MATCH (u13:User {nickname: 'young_tiger'})


MERGE (u1)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u2)
MERGE (u1)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u3)
MERGE (u1)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u4)
MERGE (u1)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u5)
MERGE (u1)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u6)
MERGE (u1)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u8)
MERGE (u1)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u9)
MERGE (u1)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u11)
MERGE (u1)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u12)

MERGE (u1)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u2)
MERGE (u1)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u3)
MERGE (u1)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u4)
MERGE (u1)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u5)
MERGE (u1)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u6)
MERGE (u1)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u8)
MERGE (u1)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u9)
MERGE (u1)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u11)
MERGE (u1)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u12)


MERGE (u6)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u7)
MERGE (u6)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u10)
MERGE (u8)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u10)
MERGE (u11)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u12)
MERGE (u9)-[:is_roommate {edge_id: randomUUID(), memo: ''}]->(u13)

MERGE (u6)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u7)
MERGE (u6)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u10)
MERGE (u8)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u10)
MERGE (u11)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u12)
MERGE (u9)<-[:is_roommate {edge_id: randomUUID(), memo: ''}]-(u13)

RETURN "Success"
"""
